import { Button, Input } from "@mui/material";

const AdminProfile = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
            <div className="border-2 border-secondaryBorder rounded-[8px] px-[74px] pt-[74px] pb-[60px] max-w-[900px] w-full bg-[#FFFFFF05]">
                <div className="flex flex-col gap-7">
                    <div className="text-mainFont text-2xl">Admin Profile</div>
                    <div className="flex flex-col gap-5 w-1/2">
                        <div className="text-mainFont text-[18px]">Admin Email</div>
                        <Input type="text" placeholder="jone.doe@gmail.com" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont" />
                    </div>
                    <div className="flex flex-col gap-5 w-1/2">
                        <div className="text-mainFont text-[18px]">Old Password</div>
                        <Input type="password" placeholder="********" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont" />
                    </div>
                    <div className="flex w-full gap-5 justify-between">
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">New Password</div>
                            <Input type="password" placeholder="********" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont" />
                        </div>
                        <div className="flex flex-col gap-5 w-full">
                            <div className="text-mainFont text-[18px]">Confirm Password</div>
                            <Input type="password" placeholder="********" className="px-4 py-3 border border-secondaryBorder rounded-[8px] focus:outline-none text-mainFont" />
                        </div>
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

export default AdminProfile;