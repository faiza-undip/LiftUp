// app.config.js
export default {
  expo: {
    name: "LiftUp",
    slug: "liftup-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/liftup-logo.png",
    scheme: "liftupapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/liftup-foreground.png",
        backgroundImage: "./assets/images/liftup-background.png",
        monochromeImage: "./assets/images/liftup-monochromatic.png",
      },
      package: "com.faizappb.liftoff",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      versionCode: 1,
      permissions: [],
    },
    web: {
      output: "static",
      favicon: "./assets/images/liftup-monochromatic.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/liftup-splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-font",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      eas: {
        projectId: "30846911-dd06-4f5a-86d8-9805dbf6e00e",
      },
    },
  },
};
