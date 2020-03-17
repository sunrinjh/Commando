const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: '접두어',
			aliases: ['prefix'],
			group: 'util',
			memberName: 'prefix',
			description: '접두어를 보여주거나, 접두어를 설정합니다.',
			format: '[prefix/"기본"/"없음"]',
			details: oneLine`
				접두어를 제공되지 않았을 경우 현재 접두어를 표시합니다.
				만약 접두어를 "기본" 으로 했을 경우 접두어는 봇의 기본 접두어로 변경됩니다.
				만약 접두어를 "없음" 으로 했을 경우 접두어가 삭제됩니다. 언급을 통해서만 명령어를 실행할 수 있습니다. 
			`,
			examples: ['접두어', '접두어 -', '접두어 야!', '접두어 기본', '접두어 없음'],

			args: [
				{
					key: 'prefix',
					prompt: '봇의 접두어를 어떻게 설정할까요?',
					type: 'string',
					max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ? `The command prefix is \`\`${prefix}\`\`.` : 'There is no command prefix.'}
				To run commands, use ${msg.anyUsage('command')}.
			`);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply('Only administrators may change the command prefix.');
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply('Only the bot owner(s) may change the global command prefix.');
		}

		// Save the prefix
		const servedPrefix = args.prefix;
		const prefix = servedPrefix == '없음' ? '' : args.prefix;
		let response;
		if(servedPrefix == '기본') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : '접두어 없는 상태';
			response = `기본 접두어로 변경했습니다. (${current} 였음)`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `접두어를 \`\`${args.prefix}\`\`로 변경했습니다.` : '접두어를 삭제했습니다.';
		}

		await msg.reply(`${response} 명령어를 실행하려면 ${msg.anyUsage('command')} 를 사용하세요.`);
		return null;
	}
};
