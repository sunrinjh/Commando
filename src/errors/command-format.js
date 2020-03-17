const FriendlyError = require('./friendly');

/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
class CommandFormatError extends FriendlyError {
	/**
	 * @param {CommandoMessage} msg - The command message the error is for
	 */
	constructor(msg) {
		super(
			`잘못된 명령어 사용방법 입니다. \`${msg.command.name}\` 명령어는 ${msg.usage(
				msg.command.format,
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} 처럼 사용하셔야 합니다. ${msg.anyUsage(
				`도움 ${msg.command.name}`,
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} 를 사용해서 명령어의 자세한 정보를 알 수 있습니다.`
		);
		this.name = 'CommandFormatError';
	}
}

module.exports = CommandFormatError;
