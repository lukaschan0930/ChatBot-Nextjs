'use client'

import Image from 'next/image'

const AdminPage = () => {
    return (
        <div className="mt-[90px] max-w-[1096px] w-full mx-auto">
            <div className="flex justify-between mb-4 gap-6">
                {['Total Users', 'Total Tokens', 'Total Tokens', 'Total Tokens'].map((title, index) => (
                    <div key={index} className="flex flex-col gap-4 w-full p-4 bg-secondaryBg rounded-[12px] border border-secondaryBorder relative">
                        <div className="text-subButtonFont text-[14px]">{title}</div>
                        <div className="text-mainFont text-[28px]">10,000</div>
                        <Image src="/image/light.svg" alt="light" width={85} height={65} className="absolute top-0 left-0" />
                    </div>
                ))}
            </div>
            <div className="bg-secondaryBg rounded-[12px] border border-secondaryBorder p-4 relative w-1/2">
                <div className="text-subButtonFont text-[14px]">Tokens / sec</div>
                <table className="w-full text-center border-collapse text-mainFont">
                    <thead>
                        <tr>
                            <th></th>
                            <th style={{ borderBottom: '1px solid #333', padding: '10px' }}>Input</th>
                            <th style={{ borderBottom: '1px solid #333', padding: '10px' }}>Output</th>
                            <th style={{ borderBottom: '1px solid #333', padding: '10px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tokens</td>
                            <td style={{ padding: '10px' }}>1</td>
                            <td style={{ padding: '10px' }}>1</td>
                            <td style={{ padding: '10px' }}>2</td>
                        </tr>
                        <tr>
                            <td>Time (s)</td>
                            <td style={{ padding: '10px' }}>0.00</td>
                            <td style={{ padding: '10px' }}>1.58</td>
                            <td style={{ padding: '10px' }}>1.58</td>
                        </tr>
                        <tr>
                            <td>Speed (t/s)</td>
                            <td style={{ padding: '10px' }}>-</td>
                            <td style={{ padding: '10px' }}>1</td>
                            <td style={{ padding: '10px' }}>1</td>
                        </tr>
                    </tbody>
                </table>
                <Image src="/image/light.svg" alt="light" width={85} height={65} className="absolute top-0 left-0" />
            </div>
        </div>
    );
}

export default AdminPage;