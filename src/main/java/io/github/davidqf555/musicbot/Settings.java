package io.github.davidqf555.musicbot;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Settings {

    private final static String SETTINGS_LOCATION = "settings.properties";
    public final static String TOKEN = getStringSetting("token");
    public final static String COMMAND = getStringSetting("command");
    public final static String ARGS = getStringSetting("args");

    private static String getStringSetting(String key) {
        Properties properties = new Properties();
        try {
            InputStream input = new FileInputStream(SETTINGS_LOCATION);
            properties.load(input);
        } catch (FileNotFoundException exception) {
            Bot.LOGGER.error("Could not find " + SETTINGS_LOCATION, exception);
            System.exit(0);
        } catch (IOException exception) {
            Bot.LOGGER.error("Error loading " + SETTINGS_LOCATION, exception);
            System.exit(0);
        }
        String value = properties.getProperty(key);
        if (value == null) {
            Bot.LOGGER.error("Could not find " + key + "key in " + SETTINGS_LOCATION);
            System.exit(0);
        } else {
            return value;
        }
        return null;
    }


    private static int getIntegerSetting(String key) {
        String string = getStringSetting(key);
        try {
            return Integer.parseInt(string);
        } catch (NumberFormatException exception) {
            Bot.LOGGER.error(key + " key is not an integer", exception);
        }
        System.exit(0);
        return 0;
    }
}
