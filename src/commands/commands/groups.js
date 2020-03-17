const { stripIndents } = require('common-tags');
const Command = require('../base');

module.exports = class ListGroupsCommand extends Command {
	constructor(client) {
		super(client, {
			name: '그룹',
			aliases: ['list-groups', 'show-groups', 'group'],
			group: 'commands',
			memberName: 'groups',
			description: '모든 명령어 그룹을 표시합니다',
			details: '관리자만이 사용가능합니다.',
			guarded: true
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg) {
		return msg.reply(stripIndents`
			__**Groups**__
			${this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? '활성회됨' : '비활성화됨'}`
			).join('\n')}
		`);
	}
};
