import { Button, Input } from "@mui/material";

const EChat = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
            <div className="border-2 border-secondaryBorder rounded-[8px] px-[74px] py-[60px] max-w-[900px] w-full bg-[#FFFFFF05]">
                <div className="flex flex-col gap-7">
                    <div className="text-mainFont text-2xl">E.Chat Setting</div>
                    <div className="flex flex-col gap-5 w-1/2">
                        <div className="text-mainFont text-[18px]">Temperature</div>
                        <Input type="text" placeholder="0.8" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont" />
                    </div>
                    <div className="flex w-full gap-5 justify-between">
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">API Endpoint</div>
                            <Input type="text" placeholder="https://api.openai.com/v1/chat/completions" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont" />
                        </div>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">API Key</div>
                            <Input type="text" placeholder="sk-proj-1234567890" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full">
                        <div className="text-mainFont text-[18px]">Chatbot System Prompt</div>
                        <textarea className="bg-inherit px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont w-full h-[200px]" />
                    </div>
                    <div className="flex justify-end gap-5">
                        <Button variant="outlined" className="bg-inherit hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-mainFont !text-sm !border !border-secondaryBorder">Cancel</Button>
                        <Button variant="contained" className="!bg-[#FAFAFA]/80 hover:!bg-[#FFFFFF] h-10 disabled:!bg-[#FAFAFA]/80 !text-[#000000] !text-sm">Update</Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default EChat;