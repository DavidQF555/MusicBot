package io.github.davidqf555.musicbot.commands;

import io.github.davidqf555.musicbot.Bot;
import io.github.davidqf555.musicbot.Util;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.VoiceChannel;

import java.util.Map;

public class SkipCommand extends Command {

    @Override
    public void onCommand(Message message, Map<String, String> args) {
        Bot.INFO.get(message.getGuild()).getScheduler().nextTrack();
    }

    @Override
    public boolean onCheck(Message message, Map<String, String> args) {
        Guild guild = message.getGuild();
        VoiceChannel channel = guild.getMember(Bot.jda.getSelfUser()).getVoiceState().getChannel();
        if (channel == null) {
            message.reply(Util.createFailedMessage("I'm not in a voice channel").build()).queue();
            return false;
        } else if (channel.equals(guild.getMember(message.getAuthor()).getVoiceState().getChannel())) {
            return true;
        }
        message.reply(Util.createFailedMessage("You must be in the same channel as me").build()).queue();
        return false;
    }
}
