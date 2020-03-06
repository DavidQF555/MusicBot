package me.david.PeterSings;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;

import me.david.PeterSings.Commands.Command;
import net.dv8tion.jda.api.entities.*;
import net.dv8tion.jda.api.events.ReadyEvent;
import net.dv8tion.jda.api.events.guild.*;
import net.dv8tion.jda.api.events.message.guild.GuildMessageReceivedEvent;
import net.dv8tion.jda.api.events.message.priv.PrivateMessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class EventListener extends ListenerAdapter {

	@Override
	public void onReady(ReadyEvent event) {
		for(Guild guild : Bot.jda.getGuilds()) {
			for(Command c : Bot.commands) {
				c.onJoin(guild);
			}
			AudioPlayer player = Bot.playerManager.createPlayer();
			AudioScheduler scheduler = new AudioScheduler(guild);
			player.addListener(scheduler);
			Bot.info.put(guild, new GuildInfo(player, scheduler));
			guild.getAudioManager().setSendingHandler(new AudioPlayerSendHandler(player));
		}
	}
		
	@Override
	public void onPrivateMessageReceived(PrivateMessageReceivedEvent event) {
		if(!event.getAuthor().isBot()) {
			PrivateChannel ch = event.getChannel();
			String s = "```List of Commands: ";
			for(Command c : Bot.commands) {
				s += "\n" + Reference.COMMAND + c.getActivatingName();
			}
			s += "```";
			ch.sendMessage(s).queue();
		}
	}

	@Override
	public void onGuildMessageReceived(GuildMessageReceivedEvent event) {
		Message m = event.getMessage();
		String s = m.getContentRaw();
		if(!event.getAuthor().isBot()) {
			for(Command c : Bot.commands) {
				if(s.startsWith(Reference.COMMAND + c.getActivatingName())) {
					if(c.hasPermission(m)) {
						if(c.correctFormat(m)) {
							c.onCommand(m);
						}
						else {
							event.getChannel().sendMessage(event.getAuthor().getAsMention() + "\n```Incorrect format. Correct Format: " + c.getFormat() + "```").queue();
						}
					}
					else {
						event.getChannel().sendMessage(event.getAuthor().getAsMention() + "\n```You do not have permission to use this command```").queue();
					}
				}
			}
		}
	}
	
	@Override
	public void onGuildJoin(GuildJoinEvent event) {
		AudioPlayer player = Bot.playerManager.createPlayer();
		AudioScheduler scheduler = new AudioScheduler(event.getGuild());
		player.addListener(scheduler);
		Bot.info.put(event.getGuild(), new GuildInfo(player, scheduler));
		event.getGuild().getAudioManager().setSendingHandler(new AudioPlayerSendHandler(player));
	}
	
	@Override
	public void onGuildLeave(GuildLeaveEvent event) {
		Guild guild = event.getGuild();
		Bot.jda.removeEventListener(Bot.info.get(guild).scheduler);
		Bot.info.remove(guild);
	}
}
