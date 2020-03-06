package me.david.PeterSings;

import com.sedmelluq.discord.lavaplayer.player.*;
import com.sedmelluq.discord.lavaplayer.player.event.*;
import com.sedmelluq.discord.lavaplayer.track.*;

import net.dv8tion.jda.api.entities.*;

public class AudioScheduler extends AudioEventAdapter {

	public final Guild guild;
	public AudioTrack current;
	
	public AudioScheduler(Guild guild) {
		this.guild = guild;
		current = null;
	}
	
	public void setTrack(AudioTrack track) {
		current = track;
		Bot.info.get(guild).player.playTrack(track);
	}

	public void queue(AudioTrack track) {
		if(Bot.info.get(guild).player.getPlayingTrack() == null) {
			setTrack(track);
			return;
		}
		Bot.info.get(guild).queue.add(track);
		
	}

	@Override
	public void onTrackStart(AudioPlayer player, AudioTrack track) {
		AudioTrackInfo info = track.getInfo();
		Bot.info.get(guild).text.sendMessage("```\"" + info.title + "\" by " + info.author + " is now playing```").queue();
	}

	@Override
	public void onTrackEnd(AudioPlayer player, AudioTrack track, AudioTrackEndReason endReason) {
		if(endReason == AudioTrackEndReason.LOAD_FAILED) {
			AudioTrackInfo info = track.getInfo();
			Bot.info.get(guild).text.sendMessage("```\"" + info.title + "\" by " + info.author + " is failing to load```").queue();
		}
		if (endReason.mayStartNext) {
			setTrack(Bot.info.get(guild).queue.poll());
		}
	}

	@Override
	public void onTrackStuck(AudioPlayer player, AudioTrack track, long thresholdMs) {
		AudioTrackInfo info = track.getInfo();
		Bot.info.get(guild).text.sendMessage("```\"" + info.title + "\" by " + info.author + " is failing to provide audio```").queue();
		setTrack(Bot.info.get(guild).queue.poll());
	}
}
