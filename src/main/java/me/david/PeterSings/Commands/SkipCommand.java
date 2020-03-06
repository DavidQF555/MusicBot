package me.david.PeterSings.Commands;

import com.sedmelluq.discord.lavaplayer.track.AudioTrackInfo;

import me.david.PeterSings.*;
import net.dv8tion.jda.api.entities.Message;

public class SkipCommand extends Command {

	@Override
	public void onCommand(Message m) {
		AudioScheduler scheduler = Bot.info.get(m.getGuild()).scheduler;
		AudioTrackInfo info = scheduler.current.getInfo();
		scheduler.setTrack(Bot.info.get(m.getGuild()).queue.poll());
		m.getChannel().sendMessage("```Skipping \"" + info.title + "\" by " + info.author + "```").queue();
	}

	@Override
	public String getFormat() {
		return Reference.COMMAND + getActivatingName();
	}

	@Override
	public String getActivatingName() {
		return "skip";
	}
}
