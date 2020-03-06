package me.david.PeterSings.Commands;

import net.dv8tion.jda.api.entities.*;

public abstract class Command {

	public void onCommand(Message m) {}
	
	public void onJoin(Guild guild) {}
	
	public void onLeave(Guild guild) {}
	
	public boolean hasPermission(Message m) {
		return true;
	}
	
	public boolean correctFormat(Message m) {
		return true;
	}
	
	public abstract String getFormat();
	
	public abstract String getActivatingName();
	
}

