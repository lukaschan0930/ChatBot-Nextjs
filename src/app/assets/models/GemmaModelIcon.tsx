import Image from "next/image";

const GemmaModelIcon = () => {
    return (
        <div>
            <Image src="/image/model/gemma.webp" className="rounded-md" alt="gemma" width={30} height={30} />
        </div>
    )
}

export default GemmaModelIcon;