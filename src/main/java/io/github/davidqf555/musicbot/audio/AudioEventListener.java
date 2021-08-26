package io.github.davidqf555.musicbot.audio;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import io.github.davidqf555.musicbot.Bot;
import io.github.davidqf555.musicbot.GuildInfo;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.events.ReadyEvent;
import net.dv8tion.jda.api.events.guild.GuildJoinEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import javax.annotation.ParametersAreNonnullByDefault;

@ParametersAreNonnullByDefault
public class AudioEventListener extends ListenerAdapter {

    @Override
    public void onReady(ReadyEvent event) {
        for (Guild guild : event.getJDA().getGuilds()) {
            initializeGuild(guild);
        }
    }

    @Override
    public void onGuildJoin(GuildJoinEvent event) {
        Guild guild = event.getGuild();
        initializeGuild(guild);
    }

    private void initializeGuild(Guild guild) {
        GuildInfo info = Bot.INFO.computeIfAbsent(guild, g -> new GuildInfo(new AudioScheduler(g), Bot.MANAGER.createPlayer()));
        AudioPlayer player = info.getPlayer();
        player.addListener(info.getScheduler());
        guild.getAudioManager().setSendingHandler(new ResultHandler(player));
    }
}
