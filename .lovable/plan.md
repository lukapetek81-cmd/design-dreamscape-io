
This is a quick reference question — no code changes.

## Check if Gradle is installed

You don't actually need a system-wide Gradle install — your project ships with the **Gradle Wrapper** (`android/gradlew`), which downloads and runs the correct Gradle version (8.11.1 per `gradle-wrapper.properties`) automatically. That's the recommended way.

### Check the wrapper (what you should use)
From project root:
```
cd android
./gradlew --version
```
Windows:
```
cd android
gradlew.bat --version
```
First run downloads Gradle 8.11.1 (~150MB) into `~/.gradle/`. Subsequent runs are instant.

Expected output includes:
```
Gradle 8.11.1
Kotlin:   ...
JVM:      17.x.x (or 21.x.x)
OS:       ...
```

### Check a system-wide Gradle install (optional)
```
gradle -v
```
If you get "command not found" / "not recognized" — it's not installed system-wide. **That's fine**, use the wrapper.

### Check Java (required for Gradle)
Gradle 8.11 needs **JDK 17 or 21**:
```
java -version
javac -version
echo $JAVA_HOME      # macOS/Linux
echo %JAVA_HOME%     # Windows
```
If Java is missing or wrong version, install **JDK 17** (Temurin/Adoptium is the easiest: https://adoptium.net) and set `JAVA_HOME`.

### If `./gradlew` fails with "Permission denied" (macOS/Linux)
```
chmod +x android/gradlew
```

### TL;DR
Use `./gradlew --version` from the `android/` folder. If it prints a Gradle version, you're ready to build. If it complains about Java, install JDK 17.
