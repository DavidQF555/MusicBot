package me.david.PeterSings.Commands;

import me.david.PeterSings.*;
import net.dv8tion.jda.api.entities.*;

public class QueueCommand extends Command {

	@Override
	public void onCommand(Message m) {
		Bot.info.get(m.getGuild()).text = (TextChannel) m.getChannel();
		String iden = m.getContentRaw().substring(Reference.COMMAND.length() + getActivatingName().length() + 1);
		m.getChannel().sendMessage("```Finding \"" + iden + "\"```").queue();
		Bot.playerManager.loadItem(iden, new AudioPlayerLoadHandler(m.getGuild(), iden));
	}

	@Override
	public String getFormat() {
		return Reference.COMMAND + getActivatingName() + " [search]\nMake sure a voice channel has been set";
	}

	@Override
	public String getActivatingName() {
		return "queue";
	}

	@Override
	public boolean correctFormat(Message m) {
		return m.getContentRaw().split(" ").length >= 2 && m.getGuild().getAudioManager().isConnected();
	}
}
