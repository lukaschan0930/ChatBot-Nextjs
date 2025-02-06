import React from "react";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

interface EditorProps {
    onChange: (data: string) => void;
    value: string;
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

function Editor({ onChange, value }: EditorProps) {
    return (
        <ReactQuill
            value={value}
            onChange={onChange}
            modules={{
                toolbar: [
                    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                    [{size: []}],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['link', 'image', 'video'],
                    ['clean']
                ],
            }}
            style={{
                height: '300px',
                backgroundColor: 'black',
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px'
            }}
        />
    );
}

export default Editor;
