export const MenuItems = [
  {
    id: "innovations",
    label: "Innovations",
    subItems: [
      {
        id: "chatText",
        label: "ECHAT",
        disable: false,
        tooltip: "A dedicated platform where users can interact with EDITH AI."
      },
      {
        id: "goland",
        label: "GOLAND",
        disable: true,
        tooltip: ""
      },
      {
        id: "eg",
        label: "EG",
        disable: true,
        tooltip: ""
      },
      {
        id: "router",
        label: "ROUTER",
        disable: true,
        tooltip: ""
      }
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    subItems: [
      {
        id: "workers",
        label: "WORKERS",
        disable: false,
        tooltip: ""
      },
      {
        id: "rwa",
        label: "RWA",
        disable: true,
        tooltip: ""
      }
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    subItems: [
      {
        id: "governance",
        label: "GOVERNANCE",
        disable: true,
        tooltip: ""
      },
      {
        id: "citizenship",
        label: "CITIZENSHIP",
        disable: true,
        tooltip: ""
      },
      {
        id: "studio",
        label: "STUDIO",
        disable: true,
        tooltip: ""
      },
      {
        id: "explorer",
        label: "EXPLORER",
        disable: false,
        tooltip: ""
      }
    ],
  }
];

export const AdminMenuItems = [
  // {
  //   id: "",
  //   label: "Dashboard",
  // },
  {
    id: "profile",
    label: "Profile",
  },
  {
    id: "eChat",
    label: "E.Chat",
  },
  {
    id: "changeLog",
    label: "Change Log",
  },
  {
    id: "taskManagement",
    label: "Task Management",
  }
];

export const logCategory = [
  {
    id: "new",
    label: "New",
  },
  {
    id: "fix",
    label: "Fix",
  },
  {
    id: "delete",
    label: "Delete",
  },
  {
    id: "improvements",
    label: "Improvements",
  }
]

export const ChatTypeItems = [
  {
    id: "normal",
    label: "Normal Chat",
    image: "/image/Edith_Logo.png"
  },
  {
    id: "faster",
    label: "Faster x30",
    image: "/image/pro.png"
  },
]

export const WorkerTypes = [
  {
    id: "compute",
    label: "Compute",
    disable: false,
  },
  {
    id: "data",
    label: "Data",
    disable: true,
  }
  // {
  //   id: "marketing",
  //   label: "Marketing",
  //   disable: true,
  // },
  // {
  //   id: "sales",
  //   label: "Sales",
  //   disable: true,
  // },
  // {
  //   id: "customer",
  //   label: "Customer",
  //   disable: true,
  // }
]

export const MaketingPlatforms = [
  {
    id: "twitter",
    label: "Twitter",
    disable: false,
    icon: "/image/icon/X-icon.png"
  }
]

export const TweetStatus = [
  {
    id: 1,
    label: "Pending",
  },
  {
    id: 2,
    label: "Approved",
  },
  {
    id: 3,
    label: "Rejected",
  },
  {
    id: 4,
    label: "Archived",
  }
]

export const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};