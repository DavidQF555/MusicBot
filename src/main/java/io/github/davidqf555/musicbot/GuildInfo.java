package io.github.davidqf555.musicbot;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import io.github.davidqf555.musicbot.audio.AudioScheduler;
import net.dv8tion.jda.api.entities.TextChannel;

public class GuildInfo {

    private final AudioScheduler scheduler;
    private final AudioPlayer player;
    private TextChannel channel;

    public GuildInfo(AudioScheduler scheduler, AudioPlayer player) {
        this.scheduler = scheduler;
        this.player = player;
    }

    public AudioScheduler getScheduler() {
        return scheduler;
    }

    public AudioPlayer getPlayer() {
        return player;
    }

    public TextChannel getTextChannel() {
        return channel;
    }

    public void setTextChannel(TextChannel channel) {
        this.channel = channel;
    }
}
