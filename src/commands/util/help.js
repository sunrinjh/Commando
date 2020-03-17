const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: '도움',
			group: 'util',
			memberName: 'help',
			aliases: ['commands','help','명령어'],
			description: '사용가능한 명령어와 함께 명령어의 자세한 내용을 보여줍니다.',
			details: oneLine`
				이 명령어(도움) 뒤에 다른 명령어를 쓰면 그 명령어에 대한 도움말을 얻을 수 있습니다.
				이 명령어 홀로 쓰였을 경우 사용 가능한 모든 명령어를 보여줍니다.
			`,
			examples: ['도움', '도움 prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: '어떤 명령어의 도움말을 표시할까요?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (서버에서만 사용 가능)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**별칭:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**그룹:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**디테일:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**예시:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('DM으로 도움말을 보냈습니다.'));
				} catch(err) {
					messages.push(await msg.reply('DM을 전송하는데 실패했습니다. DM 수신 거부 상태일 수 있습니다.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('여러개의 명령어가 검색됐습니다. 더 자세하게 말씀해보세요.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`명령어를 확인할 수 없습니다. ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} 를 사용해 전체 명령어 리스트를 확인해보세요.`
				);
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(stripIndents`
					${oneLine`
						${msg.guild ? msg.guild.name : ''} 서버에서 명령어를 사용하시려면,
						${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)} 를 사용하세요.
						예를 들어, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)} 처럼 사용하세요.
					`}
					DM에서 명령어를 사용하시려면 ${Command.usage('command', null, null)} 를 접두어 없이 사용하시면 됩니다.

					${this.usage('<command>', null, null)} 를 사용해서 명령어의 자세한 정보를 알 수 있습니다.
					${this.usage('all', null, null)} 를 사용해서 *모든* 명령어를 확인할 수 있습니다.

					__**${showAll ? '모든 명령어' : `${msg.guild || '이 DM'} 에서 사용 가능한 명령어`}**__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply('DM으로 도움말을 보냈습니다.'));
			} catch(err) {
				messages.push(await msg.reply('DM을 전송하는데 실패했습니다. DM 수신 거부 상태일 수 있습니다.'));
			}
			return messages;
		}
	}
};
