import { toast } from "@/app/hooks/use-toast";
import React, { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaSpinner } from "react-icons/fa6";
import { useAtom } from "jotai";
import {
  isStartChatAtom,
  sessionIdAtom,
  isStreamingAtom,
  roboQualityAtom,
  roboModelAtom,
  roboChatHistoryAtom,
  roboChatLogAtom,
  roboActiveChatAtom
} from "@/app/lib/store";
import { generateSessionId } from "@/app/lib/utils";
import { useSession } from "next-auth/react";
import { IFileWithUrl } from "@/app/lib/interface";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import PlusIcon from "@/app/assets/plus";
import ShadowBtn from "@/app/components/ShadowBtn";
import ChatFileMenu from "@/app/components/Chat/ChatFileMenu";
import { useAuth } from "@/app/context/AuthContext";
import RoboModelMenu from "./ModelMenu";
import { RoboModels } from "@/app/lib/stack";
import RoboSpeedMenu from "./RoboSpeedMenu";

const TEXTAREA_MIN_HEIGHT = "36px";
const TEXTAREA_MAX_HEIGHT = "100px";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#1890ff',
        ...theme.applyStyles('dark', {
          backgroundColor: '#177ddc',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

const RoboInputBox = () => {
  const [isStartChat, setIsStartChat] = useAtom(isStartChatAtom);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setMessageOver] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const [textareaWidth, setTextareaWidth] = useState<number>(0);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [roboQuality, setRoboQuality] = useAtom(roboQualityAtom);
  const [roboModel,] = useAtom(roboModelAtom);
  const [, setRoboChatHistory] = useAtom(roboChatHistoryAtom);
  const [, setRoboActiveChatAtom] = useAtom(roboActiveChatAtom);
  const [roboChatLog, setRoboChatLog] = useAtom(roboChatLogAtom);

  const [sessionId, setSessionId] = useAtom(sessionIdAtom);
  const { data: session } = useSession();
  const { setUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<IFileWithUrl[]>([]);
  const MAX_TOTAL_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const timer = useRef<number>(0)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = TEXTAREA_MIN_HEIGHT;
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        parseInt(TEXTAREA_MAX_HEIGHT)
      )}px`;
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/innovation/robochat/history");
      const data = await res.json();
      if (data.success) {
        setRoboChatHistory(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  useEffect(() => {
    setTextareaWidth(textareaRef.current?.clientWidth || 0);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId(session?.user?.email as string, Date.now().toString()));
    }
  }, [sessionId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setInputPrompt(newPrompt);
    adjustTextareaHeight();
    // Observe if text is over a line
    const textWidth = newPrompt.length * 8;
    setMessageOver(textWidth > textareaWidth * 0.8);
  };

  const keyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isStreaming && !isFileUploading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);

      // Validate that all files are images
      const nonImageFiles = filesArray.filter(file => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        toast({
          variant: "destructive",
          title: 'Only image files are allowed.',
        });
        return;
      }

      const totalSize = filesArray.reduce((acc, file) => acc + file.size, 0);

      if (totalSize > MAX_TOTAL_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: 'Total file size exceeds the 10 MB limit.',
        });
        return;
      }

      const uploadFiles = filesArray.filter((file) => {
        return !files.some(
          (prevFile) => prevFile.file.name === file.name && prevFile.file.size === file.size
        );
      });

      const fileUrls = await fileUpload(uploadFiles);

      setFiles((prevFiles) => {
        return [...prevFiles, ...fileUrls];
      });

    }
    event.target.value = '';
  };

  const fileUpload = async (fileData: File[]) => {
    setIsFileUploading(true);
    const formData = new FormData();
    fileData.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const result = await response.json();
      console.log('Files uploaded successfully:', result);
      if (!result.success) {
        throw new Error('Failed to upload files');
      }

      const uploadedResult = fileData.map((file, index) => ({ file, url: result.fileUrl[index] as string }));
      return uploadedResult;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        variant: "destructive",
        title: 'Failed to upload files',
      });
      return [];
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      return updatedFiles;
    });
  };

  const handleClickPlusIcon = () => {
    fileInputRef.current?.click();
  };

  const handleClickSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSendMessage = async () => {
    if (inputPrompt.trim() === "") {
      return;
    }

    if (isStreaming || isFileUploading) {
      return;
    }

    setIsStreaming(true);
    setIsStartChat(true);

    if (roboChatLog.length == 0) {
      setRoboChatHistory((prevRoboChatHistory) => {
        const newRoboChatHistory = [...prevRoboChatHistory];
        newRoboChatHistory.push({
          id: sessionId || generateSessionId(session?.user?.email as string, Date.now().toString()),
          title: "",
          llamaCoderVersion: "v2",
          shadcn: true,
          chats: [
            {
              role: "user",
              content: inputPrompt,
              position: 0,
              createdAt: new Date(),
              model: RoboModels[roboModel].value,
              quality: roboQuality == 1 ? "high" : "low",
              prompt: inputPrompt,
              timestamp: Number(Date.now())
            }
          ]
        });
        return newRoboChatHistory;
      });
    }

    try {
      setRoboChatLog((prevRoboChatLog) => {
        const newRoboChatLog = [...prevRoboChatLog];
        newRoboChatLog.push({
          role: "user",
          content: inputPrompt,
          position: prevRoboChatLog.length,
          createdAt: new Date(),
          model: RoboModels[roboModel].value,
          quality: roboQuality == 1 ? "high" : "low",
          prompt: inputPrompt,
          timestamp: Number(Date.now())
        });
        newRoboChatLog.push({
          role: "assistant",
          content: "",
          position: prevRoboChatLog.length + 1,
          createdAt: new Date(),
          timestamp: Number(Date.now())
        });
        return newRoboChatLog;
      });

      const res = await fetch("/api/innovation/robochat/createChat", {
        method: "POST",
        body: JSON.stringify({
          sessionId: sessionId,
          prompt: inputPrompt,
          model: RoboModels[roboModel].value,
          quality: roboQuality == 1 ? "high" : "low",
          files: files.map((file) => file.url)
        })
      });

      if (res.status == 429) {
        throw new Error('Rate limit exceeded');
      }

      if (!res.body) {
        console.error("No response body");
        throw new Error('No response body');
      }

      setFiles([]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";
      const buffer = "";
      const newChat = roboChatLog.length == 0 ? true : false;

      try {
        // Process each streamed chunk
        while (true) {
          const { done, value } = await reader?.read();
          if (done) break;

          // Decode the incoming chunk and add it to our buffer.
          const chunk = decoder.decode(value, { stream: true });
          // const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(chunk);
          // fullResponse += content;
          fullResponse += chunk;

          setRoboChatLog((prevRoboChatLog) => {
            const newLog = prevRoboChatLog && prevRoboChatLog.length > 0 ? [...prevRoboChatLog] : [];
            if (newLog.length > 0) {
              newLog[newLog.length - 1] = {
                prompt: inputPrompt,
                content: fullResponse,
                position: newLog[newLog.length - 1].position,
                role: "assistant",
                timestamp: Number(Date.now())
              };
            } else {
              newLog.push({
                prompt: inputPrompt,
                content: fullResponse,
                position: newLog[newLog.length - 1].position,
                role: "assistant",
                timestamp: Number(Date.now())
              });
            }
            return newLog;
          });
          setRoboActiveChatAtom({
            content: fullResponse,
            createdAt: new Date(),
            model: RoboModels[roboModel].value,
            quality: roboQuality == 1 ? "high" : "low",
            prompt: inputPrompt,
            role: "assistant",
            position: roboChatLog.length - 1,
            timestamp: Number(Date.now())
          });
        }

        if (buffer.trim() !== "") {
          // const { content, inputToken, outputToken, inputTime, outputTime } = await processChunkedString(buffer);
          fullResponse += buffer;
          setRoboChatLog((prevRoboChatLog) => {
            const newLog = prevRoboChatLog && prevRoboChatLog.length > 0 ? [...prevRoboChatLog] : [];
            if (newLog.length > 0) {
              newLog[newLog.length - 1] = {
                prompt: inputPrompt,
                content: fullResponse,
                position: newLog[newLog.length - 1].position,
                role: "assistant",
                timestamp: Number(Date.now())
              };
            } else {
              newLog.push({
                prompt: inputPrompt,
                content: fullResponse,
                position: newLog[newLog.length - 1].position,
                role: "assistant",
                timestamp: Number(Date.now())
              });
            }
            return newLog;
          });
          setRoboActiveChatAtom({
            content: fullResponse,
            createdAt: new Date(),
            model: RoboModels[roboModel].value,
            quality: roboQuality == 1 ? "high" : "low",
            prompt: inputPrompt,
            role: "assistant",
            position: roboChatLog.length - 1,
            timestamp: Number(Date.now())
          });
        }
      } finally {
        // Always release the reader's lock.
        reader.releaseLock();
        // if (newChat) {
        //   fetchHistory();
        // }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsStreaming(false);
      setInputPrompt("");
      setMessageOver(false);
      fetchHistory();
    }
  }

  return (
    <div
      className={`${isStartChat ? "w-full" : ""
        } bg-box-bg mt-[10px] w-full lg:w-[500px] xl:w-[700px] border rounded-[24px] border-[#25252799] flex flex-col shadow-input-box`}
    >
      <div className="flex flex-col py-2">
        <div className="flex w-full justify-between items-center px-4 py-2">
          <textarea
            ref={textareaRef}
            className={`${isStreaming ? '' : "text-mainFont"} bg-transparent pt-2 border-none w-full h-[36px] font-semibold text-base placeholder:text-[#FFFFFF33] overflow-y-hidden outline-none resize-none`}
            placeholder="Build me a budgeting app..."
            onKeyDown={keyDownHandler}
            value={inputPrompt}
            onChange={(e) => handleChange(e)}
            translate="no"
            disabled={isStreaming || isFileUploading}
            style={{
              minHeight: TEXTAREA_MIN_HEIGHT,
              maxHeight: TEXTAREA_MAX_HEIGHT,
            }}
          />
          <button
            className={`${isStreaming || isFileUploading ? "opacity-50 cursor-not-allowed" : ""} flex items-center justify-center p-2 rounded-full border-secondaryBorder bg-input-box hover:border-tertiaryBorder focus:outline-none w-9 h-9 text-mainFont`}
            onClick={(e) => handleClickSend(e)}
            disabled={isStreaming || isFileUploading}
          >
            {isStreaming ? (
              <FaSpinner className="w-auto h-full animate-spin text-black" />
            ) : (
              <FaArrowUp className="w-auto h-full text-black" />
            )}
          </button>
        </div>
      </div>
      <div className="border-t border-[#25252799] p-4 flex gap-3 justify-between w-full bg-[url('/image/text-bg.png')]">
        <div className="flex items-center gap-3">
          {
            isFileUploading ? (
              <ShadowBtn
                className="rounded-full"
                mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google w-[38px] h-[38px] text-white py-2 px-2 gap-0 rounded-full flex flex-col items-center justify-center"
                disabled={true}
              >
                <FaSpinner className="w-auto h-full animate-spin text-black" />
              </ShadowBtn>
            ) :
              files.length > 0 ? (
                <ChatFileMenu
                  files={files}
                  handleClickPlusIcon={handleClickPlusIcon}
                  handleRemoveFile={handleRemoveFile}
                  setFiles={setFiles}
                  isFileMenuOpen={isFileMenuOpen}
                  setIsFileMenuOpen={setIsFileMenuOpen}
                />
              ) : (
                <ShadowBtn
                  className="rounded-full"
                  mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google w-[38px] h-[38px] text-white py-2 px-2 gap-0 rounded-full flex flex-col items-center justify-center"
                  onClick={handleClickPlusIcon}
                >
                  <PlusIcon />
                </ShadowBtn>
              )
          }
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            ref={fileInputRef}
            multiple
          />
          <RoboModelMenu />
          {/* <ShadowBtn
          className="rounded-full"
          mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google w-[38px] h-[38px] text-white py-2 px-2 gap-0 rounded-full flex flex-col items-center justify-center"
        >
          <VoiceIcon />
        </ShadowBtn> */}
        </div>
        <ShadowBtn
          className="rounded-full max-lg:hidden"
          mainClassName="border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white py-2 px-2 gap-0 rounded-full text-sm flex items-center justify-center gap-[6px]"
        >
          High Quality (Slower)
          <AntSwitch
            inputProps={{ 'aria-label': 'Faster' }}
            onChange={(e) => {
              setRoboQuality(e.target.checked ? 1 : 0);
            }}
            checked={roboQuality == 1}
          />
        </ShadowBtn>
        <RoboSpeedMenu />
      </div>
    </div >
  )
};

export default RoboInputBox;