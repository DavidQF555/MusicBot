package io.github.davidqf555.musicbot;

import net.dv8tion.jda.api.EmbedBuilder;

import java.awt.*;

public class Util {

    public static EmbedBuilder createMessage(String desc, Color c) {
        return createMessage(desc).setColor(c);
    }

    public static EmbedBuilder createMessage(String desc) {
        return new EmbedBuilder().setDescription(desc).setColor(Color.GREEN);
    }

    public static EmbedBuilder createFailedMessage(String desc) {
        return createMessage(desc, Color.RED);
    }

}
