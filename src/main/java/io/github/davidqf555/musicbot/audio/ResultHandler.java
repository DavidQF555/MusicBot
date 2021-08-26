package io.github.davidqf555.musicbot.audio;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import com.sedmelluq.discord.lavaplayer.track.playback.AudioFrame;
import net.dv8tion.jda.api.audio.AudioSendHandler;

import java.nio.ByteBuffer;

public class ResultHandler implements AudioSendHandler {

    public final AudioPlayer audioPlayer;
    public AudioFrame lastFrame;

    public ResultHandler(AudioPlayer audioPlayer) {
        this.audioPlayer = audioPlayer;
    }

    public boolean canProvide() {
        lastFrame = audioPlayer.provide();
        return lastFrame != null;
    }

    public ByteBuffer provide20MsAudio() {
        return ByteBuffer.wrap(lastFrame.getData());
    }

    public boolean isOpus() {
        return true;
    }
}
