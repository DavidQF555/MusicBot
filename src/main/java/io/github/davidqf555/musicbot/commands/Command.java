package io.github.davidqf555.musicbot.commands;

import net.dv8tion.jda.api.entities.Message;

import java.util.Map;

public interface Command {

    default void onCommand(Message message, Map<String, String> args) {
    }

    default boolean onCheck(Message message, Map<String, String> args) {
        return true;
    }

}

