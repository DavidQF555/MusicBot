package me.david.PeterSings;

import com.sedmelluq.discord.lavaplayer.player.AudioLoadResultHandler;
import com.sedmelluq.discord.lavaplayer.tools.FriendlyException;
import com.sedmelluq.discord.lavaplayer.track.*;

import net.dv8tion.jda.api.entities.Guild;

public class AudioPlayerLoadHandler implements AudioLoadResultHandler {

	public final Guild guild;
	public final String iden;
	private boolean searched;

	public AudioPlayerLoadHandler(Guild guild, String iden) {
		this.guild = guild;
		this.iden = iden;
		searched = false;
	}

	public void trackLoaded(AudioTrack track) {
		AudioTrackInfo info = track.getInfo();
		Bot.info.get(guild).text.sendMessage("```Queuing \"" + info.title + "\" by " + info.author + "```").queue();
		Bot.info.get(guild).scheduler.queue(track);
	}

	public void playlistLoaded(AudioPlaylist playlist) {
		trackLoaded(playlist.getTracks().get(0));
	}

	public void noMatches() {
		if(!searched) {
			Bot.playerManager.loadItem("ytsearch:" + iden, this);
		}
		else {
			Bot.info.get(guild).text.sendMessage("```No matches were found```").queue();
		}
	}

	public void loadFailed(FriendlyException exception) {
		Bot.info.get(guild).text.sendMessage("```Could not load audio```").queue();
	}

}
