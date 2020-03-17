const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: '알 수 없는 명령어가 사용됐을 때 help 명령을 통해 사용가능한 명령어를 확인하라고 합니다.',
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		});
	}

	run(msg) {
		return msg.reply(
			`알 수 없는 명령어입니다. ${msg.anyUsage(
				'도움',
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} 를 통해 사용가능한 명령어를 확인해보세요.`
		);
	}
};
