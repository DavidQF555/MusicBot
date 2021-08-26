package io.github.davidqf555.musicbot.commands;

import io.github.davidqf555.musicbot.Settings;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.events.message.guild.GuildMessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import javax.annotation.Nonnull;
import java.util.HashMap;
import java.util.Map;

public class CommandEventListener extends ListenerAdapter {

    @Override
    public void onGuildMessageReceived(@Nonnull GuildMessageReceivedEvent event) {
        Message message = event.getMessage();
        String raw = message.getContentRaw().toLowerCase();
        for (CommandType type : CommandType.values()) {
            Command command = type.getCommand();
            for (String name : type.getNames()) {
                if (raw.startsWith(Settings.COMMAND + name.toLowerCase())) {
                    Map<String, String> args = new HashMap<>();
                    String all = raw.substring(Settings.COMMAND.length() + name.length()).toLowerCase();
                    int index = all.indexOf(Settings.ARGS);
                    while (index != -1) {
                        int split = all.indexOf(" ", index + 1);
                        if (split == -1) {
                            args.put(all.substring(index + 1), "");
                            break;
                        } else {
                            int next = all.indexOf(Settings.ARGS, split + 1);
                            String key = all.substring(index + 1, split);
                            if (next == -1) {
                                args.put(key, all.substring(split + 1));
                                break;
                            } else {
                                args.put(key, all.substring(split + 1, next).trim());
                                index = next;
                            }
                        }
                    }
                    if (command.onCheck(message, args)) {
                        command.onCommand(message, args);
                    }
                    return;
                }
            }
        }
    }
}
