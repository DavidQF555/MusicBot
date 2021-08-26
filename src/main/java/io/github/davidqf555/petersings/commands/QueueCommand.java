package io.github.davidqf555.petersings.commands;

import io.github.davidqf555.petersings.Bot;
import io.github.davidqf555.petersings.GuildInfo;
import io.github.davidqf555.petersings.Util;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.entities.VoiceChannel;

import java.util.Map;

public class QueueCommand extends Command {

    @Override
    public void onCommand(Message message, Map<String, String> args) {
        Guild guild = message.getGuild();
        GuildInfo info = Bot.INFO.get(guild);
        guild.getAudioManager().openAudioConnection(guild.getMember(message.getAuthor()).getVoiceState().getChannel());
        info.setTextChannel(message.getTextChannel());
        info.getScheduler().queue(args.get("title"), message);
    }

    @Override
    public boolean onCheck(Message message, Map<String, String> args) {
        Guild guild = message.getGuild();
        User user = message.getAuthor();
        VoiceChannel channel = guild.getMember(Bot.jda.getSelfUser()).getVoiceState().getChannel();
        VoiceChannel uChannel = guild.getMember(user).getVoiceState().getChannel();
        if (channel != null) {
            if (!channel.equals(uChannel)) {
                message.reply(Util.createFailedMessage("I can only be in one channel").build()).queue();
                return false;
            } else if (!args.containsKey("title")) {
                message.reply(Util.createFailedMessage("Requires -title argument").build()).queue();
                return false;
            }
        } else if (uChannel == null) {
            message.reply(Util.createFailedMessage("You must be in a voice channel").build()).queue();
            return false;
        }
        return true;
    }
}
