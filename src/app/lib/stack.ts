export const MenuItems = [
  {
    id: "chatText",
    label: "E.CHAT",
    checked: true,
    disable: false,
  },
  {
    id: "echo",
    label: "Echo",
    checked: false,
    disable: true,
    // subItems: [
    //   {
    //     id: "llm-chat",
    //     label: "LLM Chat",
    //     checked: false,
    //   },
    //   {
    //     id: "settings",
    //     label: "Settings",
    //     checked: false,
    //   },
    //   {
    //     id: "project",
    //     label: "Project",
    //     checked: false,
    //   },
    //   {
    //     id: "history",
    //     label: "History",
    //     checked: false,
    //   },
    // ],
  },
  {
    id: "chatImage",
    label: "Workers",
    checked: false,
    disable: true,
    // subItems: [
    //   {
    //     id: "normal-img-gen",
    //     label: "Normal Image Generation",
    //     checked: false,
    //   },
    // ],
  },
  {
    id: "chatVideo",
    label: "Intelligence",
    checked: false,
    disable: true,
    // subItems: [
    //   {
    //     id: "short-film-gen",

    //     label: "Short Film Generation",
    //     checked: false,
    //   },
    //   {
    //     id: "podcast",
    //     label: "Podcast",
    //     checked: false,
    //   },
    // ],
  },
  {
    id: "chatAudio",
    label: "Explorer",
    checked: false,
    disable: true,
    // subItems: [
    //   {

    //     id: "normal-conversation",
    //     label: "Normal Conversation",
    //     checked: false,
    //   },
    //   {
    //     id: "podcast",
    //     label: "Podcast",
    //     checked: false,
    //   },
    // ],
  },
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