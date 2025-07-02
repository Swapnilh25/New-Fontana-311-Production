import React, { useEffect, useRef, useState } from "react";
import { WebView } from "react-native-webview";
import {
  View,
  StyleSheet,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  Dimensions,
  AppRegistry,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import { Camera } from "expo-camera";

export default function App() {
  const webViewRef = useRef(null);
  const height = Dimensions.get("screen").height;
  const width = Dimensions.get("screen").width;

  const [visible, setVisible] = useState(false);
  const [showLoadingIcon, setShowLoadingIcon] = useState(true);

  useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  });

  useEffect(() => {
    // Add a delay before showing the back button (e.g., 2000 milliseconds or 2 seconds)
    const delayTimeout = setTimeout(() => {
      registerForPermissions();
      setShowLoadingIcon(false);
    }, 3000);

    // Cleanup function to clear the timeout on component unmount or re-render
    return () => clearTimeout(delayTimeout);
  }, []);

  const registerForPermissions = async () => {
    // Request camera permission
    const { status: existingCameraStatus } =
      await Camera.getCameraPermissionsAsync();
    if (existingCameraStatus !== "granted") {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        showExplanationModal(
          "Camera and Location Permission Required",
          "App needs to know your location and camera access to capture the incident to report."
        );
      }
    }

    // Request location permission
    const { status: existingLocationStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (existingLocationStatus !== "granted") {
      console.log("Location permission not granted");
    }

    registerForPushNotificationsAsync();
  };

  const showExplanationModal = (title, message) => {
    // Replace this with your actual code to display a modal or alert to the user
    alert(`${title}\n\n${message}`);
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <WebView
        ref={webViewRef}
        source={{
          uri: `https://cityoffontana.my.site.com/311/s?deviceType=android`,
        }}
        // onLoadStart={() => setVisible(true)}
        // onLoadEnd={() => setVisible(false)}
        onError={(event) => {
          console.log(event);
          alert(`Webview Error : ${event.nativeEvent.description}`);
        }}
      />
      {showLoadingIcon && (
        <ActivityIndicator
          color={"#05395c"}
          style={{
            position: "absolute",
            top: height / 2,
            left: width / 2.2,
          }}
          size={"large"}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppRegistry.registerComponent("Fontana_311", () => App);
