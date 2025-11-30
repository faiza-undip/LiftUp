import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  async function loadProfile() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, gender, birth_date, height_cm, weight_kg, avatar_url")
      .eq("id", user!.id)
      .maybeSingle();

    if (error) {
      console.log("Profile load error", error);
      Alert.alert("Error", "Failed to load profile.");
    } else if (data) {
      setFullName(data.full_name ?? "");
      setGender(data.gender ?? "");
      setBirthDate(data.birth_date ?? "");
      setHeightCm(data.height_cm?.toString() ?? "");
      setWeightKg(data.weight_kg?.toString() ?? "");
      setAvatarUrl(data.avatar_url ?? null);
    }

    setLoading(false);
  }

  async function saveProfile() {
    if (!user) return;

    if (!gender || !birthDate || !heightCm || !weightKg) {
      Alert.alert(
        "Incomplete",
        "Gender, birth date, height, and weight cannot be empty."
      );
      return;
    }

    const payload = {
      id: user.id,
      full_name: fullName || null,
      gender,
      birth_date: birthDate,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      avatar_url: avatarUrl,
    };

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      console.log("Profile save error", error);
      Alert.alert("Error", "Failed to save profile.");
    } else {
      Alert.alert("Saved", "Your profile has been updated.");
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", "Failed to log out.");
    }
  }

  async function pickAvatar() {
    if (!user) return;

    // Ask permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photos to set a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset.uri) return;

    setUploading(true);

    try {
      const uri = asset.uri;
      const fileExt = (asset.fileName?.split(".").pop() || "jpg").toLowerCase();
      const filePath = `${user.id}.${fileExt}`;

      // Supabase RN upload supports { uri, name, type } file objects
      const file = {
        uri,
        name: filePath,
        type: asset.mimeType || "image/jpeg",
      } as any;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.log(uploadError);
        Alert.alert("Upload error", uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setAvatarUrl(publicUrl);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (profileError) {
        console.log(profileError);
        Alert.alert("Error", "Avatar uploaded but failed to save profile.");
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", "Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text style={styles.title}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user?.email?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={pickAvatar}
          disabled={uploading}
        >
          <Text style={styles.avatarButtonText}>
            {uploading ? "Uploading..." : "Change Photo"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#6B7280"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Male / Female"
              placeholderTextColor="#6B7280"
              value={gender}
              onChangeText={setGender}
            />

            <Text style={styles.label}>Birth Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6B7280"
              value={birthDate}
              onChangeText={setBirthDate}
            />

            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 170"
              placeholderTextColor="#6B7280"
              value={heightCm}
              onChangeText={setHeightCm}
            />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 70"
              placeholderTextColor="#6B7280"
              value={weightKg}
              onChangeText={setWeightKg}
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveProfile}
            >
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 16 },
  loading: { color: "#9CA3AF", marginTop: 16 },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#111827",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#9CA3AF",
    fontSize: 32,
    fontWeight: "700",
  },
  avatarButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1F2933",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  avatarButtonText: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  section: { marginBottom: 20 },
  label: { color: "#9CA3AF", marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: "#111827",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  readonlyBox: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  readonlyText: { color: "#D1D5DB" },
  buttonGroup: { marginTop: 8, gap: 12, marginBottom: 16 },
  primaryButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: { color: "#050814", fontWeight: "700", fontSize: 16 },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoutText: { color: "#FCA5A5", fontWeight: "600" },
});
