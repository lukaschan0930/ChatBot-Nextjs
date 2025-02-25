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
        disable: true,
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
        disable: true,
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
    // {
    //   id: "eChat",
    //   label: "E.Chat",
    // },
    {
      id: "changeLog",
      label: "Change Log",
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
        id: "deep",
        label: "Pro (Deep Search)",
        image: "/image/pro.png"
    },
]