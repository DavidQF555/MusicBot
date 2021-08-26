package io.github.davidqf555.musicbot.audio;

import com.sedmelluq.discord.lavaplayer.player.AudioLoadResultHandler;
import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import com.sedmelluq.discord.lavaplayer.player.event.AudioEventAdapter;
import com.sedmelluq.discord.lavaplayer.tools.FriendlyException;
import com.sedmelluq.discord.lavaplayer.track.AudioPlaylist;
import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import com.sedmelluq.discord.lavaplayer.track.AudioTrackEndReason;
import com.sedmelluq.discord.lavaplayer.track.AudioTrackInfo;
import io.github.davidqf555.musicbot.Bot;
import io.github.davidqf555.musicbot.Util;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.TextChannel;

import java.util.LinkedList;
import java.util.Queue;

public class AudioScheduler extends AudioEventAdapter {

    private final Guild guild;
    private final Queue<AudioTrack> tracks;

    public AudioScheduler(Guild guild) {
        this.guild = guild;
        tracks = new LinkedList<>();
    }

    public void nextTrack() {
        getPlayer().stopTrack();
        if (!tracks.isEmpty()) {
            getPlayer().playTrack(tracks.poll());
        }
    }

    public void queue(String track, Message message) {
        Bot.MANAGER.loadItem("ytsearch:" + track, new ResultHandler(track, message));
    }

    public AudioPlayer getPlayer() {
        return Bot.INFO.get(guild).getPlayer();
    }

    public TextChannel getTextChannel() {
        return Bot.INFO.get(guild).getTextChannel();
    }

    @Override
    public void onTrackStart(AudioPlayer player, AudioTrack track) {
        AudioTrackInfo info = track.getInfo();
        getTextChannel().sendMessage(Util.createMessage("Playing [" + info.title + "](" + info.uri + ")").build()).queue();
    }

    @Override
    public void onTrackEnd(AudioPlayer player, AudioTrack track, AudioTrackEndReason endReason) {
        if (endReason.mayStartNext) {
            if (endReason == AudioTrackEndReason.LOAD_FAILED) {
                AudioTrackInfo info = track.getInfo();
                getTextChannel().sendMessage(Util.createFailedMessage("[" + info.title + "](" + info.uri + ") is failing to load").build()).queue();
            }
            nextTrack();
        }
    }

    @Override
    public void onTrackStuck(AudioPlayer player, AudioTrack track, long thresholdMs) {
        AudioTrackInfo info = track.getInfo();
        getTextChannel().sendMessage(Util.createFailedMessage("[" + info.title + "](" + info.uri + ") is failing to provide audio").build()).queue();
    }

    private class ResultHandler implements AudioLoadResultHandler {

        private final String search;
        private final Message message;

        private ResultHandler(String search, Message message) {
            this.search = search;
            this.message = message;
        }

        @Override
        public void trackLoaded(AudioTrack track) {
            tracks.add(track);
            AudioTrackInfo info = track.getInfo();
            message.reply(Util.createMessage("Queued [" + info.title + "](" + info.uri + ")").build()).queue();
            if (getPlayer().getPlayingTrack() == null) {
                nextTrack();
            }
        }

        @Override
        public void playlistLoaded(AudioPlaylist playlist) {
            trackLoaded(playlist.getTracks().get(0));
        }

        @Override
        public void noMatches() {
            message.reply(Util.createFailedMessage("Could not find `" + search + "`").build()).queue();
        }

        @Override
        public void loadFailed(FriendlyException exception) {
            message.reply(Util.createFailedMessage("Could not load `" + search + "`").build()).queue();
        }

    }

}