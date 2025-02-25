import { openai } from "./const";
import { PdfReader } from "pdfreader";
import mammoth from "mammoth";
import * as xlsx from "xlsx";
import {
    VectorStoreIndex,
    storageContextFromDefaults,
    Document
} from "llamaindex";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { PineconeVectorStore } from "@llamaindex/pinecone";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateEmbeddings = async (text: string | string[]) => {
    const maxWords = 500;
    const overlap = 20;
    const texts = Array.isArray(text) ? text : [text];
    const chunks = texts.flatMap(t => {
        const words = t.split(/\s+/);
        const result = [];
        for (let i = 0; i < words.length; i += maxWords - overlap) {
            const chunk = words.slice(i, i + maxWords).join(' ');
            result.push(chunk);
        }
        return result;
    });

    const embeddings = [];
    console.log("chunks", chunks.length);
    for (const chunk of chunks) {
        const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunk,
        });
        embeddings.push(embedding.data[0].embedding);
        await sleep(500);
    }

    return embeddings;
}

export const generateEmbeddingFromFile = async (file: Blob) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    let vector: number[] | number[][] | undefined;
    console.log("fileType", fileType);

    switch (fileType) {
        case "application/pdf":
            const pdfData = await new Promise<string>((resolve, reject) => {
                let fullText = "";
                new PdfReader().parseBuffer(buffer, (err, item) => {
                    if (err) {
                        reject(err);
                    } else if (!item) {
                        resolve(fullText);
                    } else if (item.text) {
                        fullText += item.text + " ";
                    }
                });
            });
            vector = await generateEmbeddings(pdfData);
            break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            const mammothResult = await mammoth.extractRawText({ buffer });
            vector = await generateEmbeddings(mammothResult.value);
            break;
        case "application/vnd.ms-excel":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            const workbook = xlsx.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const text = xlsx.utils.sheet_to_json(sheet);
            vector = await generateEmbeddings(JSON.stringify(text));
            break;
        case "text/csv":
            vector = await generateEmbeddings(buffer.toString('utf-8'));
            break;
        case "text/plain":
            vector = await generateEmbeddings(buffer.toString('utf-8'));
            break;
        case "application/json":
            vector = await generateEmbeddings(JSON.parse(buffer.toString('utf-8')));
            break;
        case "text/html":
            vector = await generateEmbeddings(buffer.toString('utf-8'));
            break;
        default:
            console.log("Unsupported file type");
            break;
    }

    return vector;
}

const generateDocument = async (file: File) => {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        let documents: Document[] = [];

        switch (file.type) {
            case "application/pdf":
                documents = await new Promise<Document[]>((resolve, reject) => {
                    const pages: string[] = [];
                    new PdfReader().parseBuffer(buffer, (err, item) => {
                        if (err) {
                            reject(err);
                        } else if (!item) {
                            resolve(pages.map((pageText, index) => new Document({
                                text: pageText.trim(),
                                metadata: {
                                    file_name: file.name,
                                    page_number: index + 1,
                                },
                            })));
                        } else if (item.page) {
                            pages.push("");
                        } else if (item.text) {
                            pages[pages.length - 1] += item.text + " ";
                        }
                    });
                });
                break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                const mammothResult = await mammoth.extractRawText({ buffer });
                documents = [new Document({
                    text: mammothResult.value.trim(),
                    metadata: {
                        file_name: file.name,
                    },
                })];
                break;
            case "application/vnd.ms-excel":
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                const workbook = xlsx.read(buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const text = JSON.stringify(xlsx.utils.sheet_to_json(sheet));
                documents = [new Document({
                    text: text.trim(),
                    metadata: {
                        file_name: file.name,
                    },
                })];
                break;
            case "text/csv":
            case "text/plain":
            case "application/json":
            case "text/html":
                const textContent = buffer.toString('utf-8');
                documents = [new Document({
                    text: textContent.trim(),
                    metadata: {
                        file_name: file.name,
                    },
                })];
                break;
            default:
                console.log(`Unsupported file type: ${file.type}`);
                break;
        }

        return documents;
    } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
    }
}

export async function generateDatasource(sessionId: string, files: File[]) {
    try {
        console.log(`Generating storage context...`);
        const vectorStore = new PineconeVectorStore({
            indexName: "edith-chatapp-file",
            apiKey: process.env.PINECONE_API_KEY!,
            namespace: sessionId,
        });
        const storageContext = await storageContextFromDefaults({ vectorStore });
        const documents = [];

        for (const file of files) {
            try {
                const document = await generateDocument(file);
                if (document) {
                    documents.push(...document);
                }
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
            }
        }

        await VectorStoreIndex.fromDocuments(documents, {
            storageContext,
        });

        console.log("Documents generated");
        return true;
    } catch (error) {
        console.error("Error generating documents:", error);
        return false;
    }
}

export async function readDatasource(sessionId: string, query: string) {
    const vectorStore = new PineconeVectorStore({
        indexName: "edith-chatapp-file",
        apiKey: process.env.PINECONE_API_KEY!,
        namespace: sessionId,
    });
    const index = await VectorStoreIndex.fromVectorStore(vectorStore);
    const queryEngine = index.asQueryEngine({
        similarityTopK: 5,
    });
    const result = await queryEngine.query({
        query: query
    });
    let context = "";
    if (typeof result === 'string') {
        context = result;
    } else if (Array.isArray(result.message?.content)) {
        context = result.message.content.join(' '); // Join array elements into a single string
    } else {
        context = result.message?.content || "";
    }
    return context;
}

