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
        id: "roboChat",
        label: "ROBO",
        disable: true,
        tooltip: ""
      },
      // {
      //   id: "router",
      //   label: "ROUTER",
      //   disable: false,
      //   tooltip: ""
      // }
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
      }
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    subItems: [
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
  // {
  //   id: "taskManagement",
  //   label: "Task Management",
  // }
  {
    id: "modelManagement",
    label: "Model Management",
  },
  {
    id: "subscriptionPlan",
    label: "Subscription Plan",
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

export const RoboModels = [
  {
    label: "DeepSeek V3",
    value: "deepseek-ai/DeepSeek-V3",
  },
  {
    label: "Qwen 2.5 Coder 32B",
    value: "Qwen/Qwen2.5-Coder-32B-Instruct",
  },

  {
    label: "Llama 4 Maverick",
    value: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
  },
  {
    label: "Llama 3.3 70B",
    value: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  },
  {
    label: "Llama 3.1 405B",
    value: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
  },
];

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

export const getRandomNumberBasedonUTCTime = (min: number, max: number) => {
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours()));
  const utcTime = utcDate.getTime();
  const range = max - min + 1;
  const hash = Math.abs(utcTime % range);
  const result = min + hash;
  return Math.min(result, max);
};

export const ModelType = [
  {
    id: "text",
    label: "Text Generation",
  },
  // {
  //   id: "image",
  //   label: "Image Generation",
  // },
  // {
  //   id: "audio",
  //   label: "Audio Generation",
  // }
]

export const Credits = {
  "free": 2,
  "pro": 20
}