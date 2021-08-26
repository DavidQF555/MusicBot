package io.github.davidqf555.petersings.commands;

public enum CommandType {

    QUEUE(new QueueCommand(), "queue"),
    SKIP(new SkipCommand(), "skip");

    private final Command command;
    private final String[] names;

    CommandType(Command command, String... names) {
        this.command = command;
        this.names = names;
    }

    public Command getCommand() {
        return command;
    }

    public String[] getNames() {
        return names;
    }
}
