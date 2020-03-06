package me.david.PeterSings.Commands;

import me.david.PeterSings.Reference;
import net.dv8tion.jda.api.entities.*;

public class SetVoiceChannelCommand extends Command {

	@Override
	public void onCommand(Message m) {
		VoiceChannel voice = getVoiceChannel(m);
		m.getGuild().getAudioManager().openAudioConnection(voice);
		m.getChannel().sendMessage("```Voice channel set to \"" + voice.getName() + "\"```").queue();
	}
	
	@Override
	public boolean correctFormat(Message m) {
		return getVoiceChannel(m) != null && m.getContentRaw().split(" ").length >= 2;
	}
	
	@Override
	public String getFormat() {
		return Reference.COMMAND + getActivatingName() + " [voice channel name]";
	}

	@Override
	public String getActivatingName() {
		return "voice";
	}
	
	private VoiceChannel getVoiceChannel(Message m) {
		for(String s : m.getContentRaw().substring(Reference.COMMAND.length() + getActivatingName().length()).split(" ")) {
			for(GuildChannel c : m.getGuild().getChannels()) {
				if(c.getName().equalsIgnoreCase(s) && c.getType() == ChannelType.VOICE) {
					return (VoiceChannel) c;
				}
			}
		}
		return null;
	}
}
