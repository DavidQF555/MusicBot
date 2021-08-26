package io.github.davidqf555.musicbot.commands;

import net.dv8tion.jda.api.entities.Message;

import java.util.Map;

public abstract class Command {

    public void onCommand(Message message, Map<String, String> args) {
    }

    public boolean onCheck(Message message, Map<String, String> args) {
        return true;
    }

}

