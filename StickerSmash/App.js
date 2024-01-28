import { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import domtoimage from "dom-to-image";

import ImageViewer from "./components/imageViewer/image-viewer";
import Button from "./components/button/button";
import PrimaryButton from "./components/primaryButton/primary-button";
import IconButton from "./components/iconButton/icon-button";
import CircleButton from "./components/circleButton/circle-button";
import EmojiPicker from "./components/emojiPicker/emoji-picker";
import EmojiList from "./components/emojiList/emoji-list";

import PlaceholderImage from "./assets/images/background-image.png";
import EmojiSticker from "./components/emojiSticker/emoji-sticker";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const imageRef = useRef();

  const [status, requestPermission] = MediaLibrary.usePermissions();

  const [selectedImage, setSelectedImage] = useState(null);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState(null);

  if (status === null) {
    requestPermission();
  }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert("No image selected.");
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    if (Platform.OS !== "web") {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert("Saved!");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement("a");
        link.download = "sticker-smash.jpeg";
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer
            placeholderImageSource={PlaceholderImage}
            selectedImage={selectedImage}
          />
          {pickedEmoji && (
            <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />
          )}{" "}
        </View>
      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton
              icon="save-alt"
              label="Save"
              onPress={onSaveImageAsync}
            />
          </View>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          <PrimaryButton label="Choose a photo" onPress={pickImageAsync} />
          <Button label="Use this photo" onPress={setShowAppOptions} />
        </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  optionsContainer: {
    paddingTop: 60,
    paddingBottom: 60,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});
