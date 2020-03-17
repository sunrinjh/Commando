const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class EnableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: '활성화',
			aliases: ['enable-command', 'cmd-on', 'command-on', 'enable'],
			group: 'commands',
			memberName: 'enable',
			description: '명령어, 혹은 명령어 그룹을 활성화합니다.',
			details: oneLine`
				인자값은 명령어, 혹은 명령어 그룹의 이름/ID여야 합니다.
				관리자만이 이 명령어를 사용할 수 있습니다.
			`,
			examples: ['활성화 util', '활성화 Utility', '활성화 prefix'],
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
		const group = args.cmdOrGrp.group;
		if(args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				`\`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} 은/는 이미 활성화 상태입니다${
					group && !group.isEnabledIn(msg.guild) ?
					`, 하지만 \`${group.name}\` 그룹이 비활성화 상태입니다, 따라서 명령어를 사용할 수 없습니다` :
					''
				}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		return msg.reply(
			`\`${args.cmdOrGrp.name}\` ${group ? 'command' : 'group'} 을/를 활성화 했습니다${
				group && !group.isEnabledIn(msg.guild) ?
				`, 하지만 \`${group.name}\` 그룹이 비활성화 상태입니다, 따라서 명령어를 사용할 수 없습니다` :
				''
			}.`
		);
	}
};
