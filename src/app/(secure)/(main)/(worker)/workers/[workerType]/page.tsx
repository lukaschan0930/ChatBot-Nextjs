import ExplorerWorker from "@/app/components/intelligence/explorer/worker";

export default async function Page({ params }: { params: Promise<{ workerType: string }> }) {
    const { workerType } = await params;
    console.log("workerType", workerType);

    return (
        <ExplorerWorker />
    )
}