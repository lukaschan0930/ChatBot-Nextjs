import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { sha256 } from "js-sha256"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSessionId(email: string, timestamp: string) {
  return sha256(`${email}-${timestamp}`);
}

export const LABELS = {
  'change-wallet': 'Change wallet',
  connecting: 'Connecting ...',
  'copy-address': 'Copy address',
  copied: 'Copied',
  disconnect: 'Disconnect',
  'has-wallet': 'Connect',
  'no-wallet': 'Select Wallet',
} as const;

export const processChunkedString = (chunkedString: string): Promise<{ content: string, inputToken: number, outputToken: number, inputTime: number, outputTime: number }> => {
  return new Promise((resolve, reject) => {
    console.log("chunkedString", chunkedString);
    const jsonArrayString = `[${chunkedString.replace(/}\s*{/g, '},{')}]`;
    console.log("jsonArrayString", jsonArrayString);
    let content = "";
    let inputToken = 0;
    let outputToken = 0;
    let inputTime = 0;
    let outputTime = 0;

    try {
      const jsonArray = JSON.parse(jsonArrayString);
      jsonArray.forEach((data: any) => {
        inputToken += data.inputToken;
        outputToken += data.outputToken;
        inputTime += data.inputTime;
        outputTime += data.outputTime;
        content += data.content;
      });
      resolve({ content, inputToken, outputToken, inputTime, outputTime });
    } catch (error) {
      console.error("Error parsing JSON array string:", error);
      reject(error);
    }
  });
};

export const validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const validatePassword = (password: string) => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  return passwordPattern.test(password);
};

export function extractFirstCodeBlock(input: string) {
  // 1) We use a more general pattern for the code fence:
  //    - ^```([^\n]*) captures everything after the triple backticks up to the newline.
  //    - ([\s\S]*?) captures the *body* of the code block (non-greedy).
  //    - Then we look for a closing backticks on its own line (\n```).
  // The 'm' (multiline) flag isn't strictly necessary here, but can help if input is multiline.
  // The '([\s\S]*?)' is a common trick to match across multiple lines non-greedily.
  const match = input.match(/```([^\n]*)\n([\s\S]*?)\n```/);

  if (match) {
    const fenceTag = match[1] || ""; // e.g. "tsx{filename=Calculator.tsx}"
    const code = match[2]; // The actual code block content
    const fullMatch = match[0]; // Entire matched string including backticks

    // We'll parse the fenceTag to extract optional language and filename
    let language: string | null = null;
    let filename: { name: string; extension: string } | null = null;

    // Attempt to parse out the language, which we assume is the leading alphanumeric part
    // Example: fenceTag = "tsx{filename=Calculator.tsx}"
    const langMatch = fenceTag.match(/^([A-Za-z0-9]+)/);
    if (langMatch) {
      language = langMatch[1];
    }

    // Attempt to parse out a filename from braces, e.g. {filename=Calculator.tsx}
    const fileMatch = fenceTag.match(/{\s*filename\s*=\s*([^}]+)\s*}/);
    if (fileMatch) {
      filename = parseFileName(fileMatch[1]);
    }

    return { code, language, filename, fullMatch };
  }
  return null; // No code block found
}

function parseFileName(fileName: string): { name: string; extension: string } {
  // Split the string at the last dot
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    // No dot found
    return { name: fileName, extension: "" };
  }
  return {
    name: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex + 1),
  };
}

export function splitByFirstCodeFence(markdown: string) {
  const result: {
    type: "text" | "first-code-fence" | "first-code-fence-generating";
    content: string;
    filename: { name: string; extension: string };
    language: string;
  }[] = [];

  const lines = markdown.split("\n");

  let inFirstCodeFence = false; // Are we currently inside the first code fence?
  let codeFenceFound = false; // Have we fully closed the first code fence?
  let textBuffer: string[] = [];
  let codeBuffer: string[] = [];

  // We'll store these when we open the code fence
  let fenceTag = ""; // e.g. "tsx{filename=Calculator.tsx}"
  let extractedFilename: string | null = null;

  // Regex to match an entire code fence line, e.g. ```tsx{filename=Calculator.tsx}
  const codeFenceRegex = /^```([^\n]*)$/;

  for (const line of lines) {
    const match = line.match(codeFenceRegex);

    if (!codeFenceFound) {
      if (match && !inFirstCodeFence) {
        // -- OPENING the first code fence --
        inFirstCodeFence = true;
        fenceTag = match[1] || ""; // e.g. tsx{filename=Calculator.tsx}

        // Attempt to extract filename from {filename=...}
        const fileMatch = fenceTag.match(/{\s*filename\s*=\s*([^}]+)\s*}/);
        extractedFilename = fileMatch ? fileMatch[1] : null;

        // Flush any accumulated text into the result
        if (textBuffer.length > 0) {
          result.push({
            type: "text",
            content: textBuffer.join("\n"),
            filename: { name: "", extension: "" },
            language: "",
          });
          textBuffer = [];
        }
        // Don't add the fence line itself to codeBuffer
      } else if (match && inFirstCodeFence) {
        // -- CLOSING the first code fence --
        inFirstCodeFence = false;
        codeFenceFound = true;

        // Parse the extracted filename into { name, extension }
        const parsedFilename = extractedFilename
          ? parseFileName(extractedFilename)
          : { name: "", extension: "" };

        // Extract language from the portion of fenceTag before '{'
        const bracketIndex = fenceTag.indexOf("{");
        const language =
          bracketIndex > -1
            ? fenceTag.substring(0, bracketIndex).trim()
            : fenceTag.trim();

        result.push({
          type: "first-code-fence",
          // content: `\`\`\`${fenceTag}\n${codeBuffer.join("\n")}\n\`\`\``,
          content: codeBuffer.join("\n"),
          filename: parsedFilename,
          language,
        });

        // Reset code buffer
        codeBuffer = [];
      } else if (inFirstCodeFence) {
        // We are inside the first code fence
        codeBuffer.push(line);
      } else {
        // Outside any code fence
        textBuffer.push(line);
      }
    } else {
      // The first code fence has already been processed; treat all remaining lines as text
      textBuffer.push(line);
    }
  }

  // If the first code fence was never closed
  if (inFirstCodeFence) {
    const parsedFilename = extractedFilename
      ? parseFileName(extractedFilename)
      : { name: "", extension: "" };

    // Extract language from the portion of fenceTag before '{'
    const bracketIndex = fenceTag.indexOf("{");
    const language =
      bracketIndex > -1
        ? fenceTag.substring(0, bracketIndex).trim()
        : fenceTag.trim();

    result.push({
      type: "first-code-fence-generating",
      // content: `\`\`\`${fenceTag}\n${codeBuffer.join("\n")}`,
      content: codeBuffer.join("\n"),
      filename: parsedFilename,
      language,
    });
  } else if (textBuffer.length > 0) {
    // Flush any remaining text
    result.push({
      type: "text",
      content: textBuffer.join("\n"),
      filename: { name: "", extension: "" },
      language: "",
    });
  }

  return result;
}

export function toTitleCase(rawName: string): string {
  // Split on one or more hyphens or underscores
  const parts = rawName.split(/[-_]+/);

  // Capitalize each part and join them back with spaces
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M';
  }
  if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'k';
  }
  return num.toFixed(2).toString();
};

export const processResponse = (response: string) => {
  const errorMatch = response.match(/\[ERROR\](.*)/);
  const pointsMatch = response.match(/\[POINTS\](.*)/);
  const outputTimeMatch = response.match(/\[OUTPUT_TIME\](.*)/);

  if (errorMatch) {
      return { mainResponse: response, points: null, outputTime: null, error: errorMatch[1] };
  }

  if (pointsMatch || outputTimeMatch) {
      const mainResponse = response.substring(0, pointsMatch?.index || outputTimeMatch?.index || response.length).trim();
      const points = pointsMatch ? pointsMatch[1] : null;
      const outputTime = outputTimeMatch ? outputTimeMatch[1] : null;
      return { mainResponse, points, outputTime };
  }
  return { mainResponse: response, points: null, outputTime: null };
};