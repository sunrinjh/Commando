const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class DisableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: '비활성화',
			aliases: ['disable-command', 'cmd-off', 'command-off', 'disable'],
			group: 'commands',
			memberName: 'disable',
			description: '명령어, 혹은 명령어 그룹을 비활성화합니다.',
			details: oneLine`
				인자값은 명령어, 혹은 명령어 그룹의 이름/ID여야 합니다.
				관리자만이 이 명령어를 사용할 수 있습니다.
			`,
			examples: ['비활성화 util', '비활성화 Utility', '비활성화 prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: '어떤 명령어, 혹은 명령어 그룹을 비활성화할까요?',
					type: 'group|command'
				}
			]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg, args) {
		if(!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				` \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} 은/는 이미 비활성화 상태입니다. `
			);
		}
		if(args.cmdOrGrp.guarded) {
			return msg.reply(
				`\`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} 은/는 비활성화 할 수 없습니다.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, false);
		return msg.reply(` \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} 을/를 비활성화 했습니다. `);
	}
};
