package io.github.davidqf555.petersings;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayerManager;
import com.sedmelluq.discord.lavaplayer.player.DefaultAudioPlayerManager;
import com.sedmelluq.discord.lavaplayer.source.youtube.YoutubeAudioSourceManager;
import io.github.davidqf555.petersings.audio.AudioEventListener;
import io.github.davidqf555.petersings.commands.CommandEventListener;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.internal.utils.JDALogger;
import org.slf4j.Logger;

import javax.security.auth.login.LoginException;
import java.util.HashMap;
import java.util.Map;

public class Bot {

    public static final Logger LOGGER = JDALogger.getLog(Bot.class);
    public final static Map<Guild, GuildInfo> INFO = new HashMap<>();
    public final static AudioPlayerManager MANAGER = new DefaultAudioPlayerManager();
    public static JDA jda;

    public static void main(String[] args) {
        try {
            jda = JDABuilder.createDefault(Settings.TOKEN).build();
        } catch (LoginException exception) {
            LOGGER.error("Invalid Token", exception);
            System.exit(0);
        }
        jda.addEventListener(new CommandEventListener());
        jda.addEventListener(new AudioEventListener());
        MANAGER.registerSourceManager(new YoutubeAudioSourceManager(true));
    }
}
