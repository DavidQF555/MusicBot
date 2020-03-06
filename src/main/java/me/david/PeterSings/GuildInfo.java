package me.david.PeterSings;

import java.util.*;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import com.sedmelluq.discord.lavaplayer.track.AudioTrack;

import net.dv8tion.jda.api.entities.TextChannel;

public class GuildInfo {

	public final Queue<AudioTrack> queue;
	public final AudioPlayer player;
	public TextChannel text;
	public final AudioScheduler scheduler;
	
	public GuildInfo(AudioPlayer player, AudioScheduler scheduler) {
		queue = new LinkedList<AudioTrack>();
		this.player = player;
		this.scheduler = scheduler;
	}
}
