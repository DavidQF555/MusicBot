package me.david.PeterSings;

import java.util.*;

import javax.security.auth.login.LoginException;

import com.sedmelluq.discord.lavaplayer.jdaudp.NativeAudioSendFactory;
import com.sedmelluq.discord.lavaplayer.player.*;
import com.sedmelluq.discord.lavaplayer.source.soundcloud.SoundCloudAudioSourceManager;
import com.sedmelluq.discord.lavaplayer.source.youtube.YoutubeAudioSourceManager;

import me.david.PeterSings.Commands.*;
import net.dv8tion.jda.api.*;
import net.dv8tion.jda.api.entities.*;

public class Bot {

	public static JDA jda; 
	public static User owner;
	public final static Map<Guild, GuildInfo> info = new HashMap<Guild, GuildInfo>();
	public final static AudioPlayerManager playerManager = new DefaultAudioPlayerManager();
	public final static List<Command> commands = new ArrayList<Command>();
	
	public static void main(String[] args) throws LoginException {
		jda = new JDABuilder(Reference.TOKEN).setAudioSendFactory(new NativeAudioSendFactory()).build();
		owner = jda.retrieveUserById(Reference.OWNER_ID).complete();
		jda.addEventListener(new EventListener());
		 playerManager.registerSourceManager(new YoutubeAudioSourceManager(true));
		 playerManager.registerSourceManager(SoundCloudAudioSourceManager.createDefault());
		
		commands.add(new QueueCommand());
		commands.add(new SetVoiceChannelCommand());
		commands.add(new SkipCommand());
	}
}
