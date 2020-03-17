const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class UnloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: '언로드',
			aliases: ['unload-command', 'unload'],
			group: 'commands',
			memberName: 'unload',
			description: '명령어를 언로드합니다.',
			details: oneLine`
				인자값은 \`group:memberName\` 형태로 완전한 명령어 이름이 주어져야 합니다.
				디스코드 봇 소유자만 이 명령어를 사용할 수 있습니다.
			`,
			examples: ['언로드 some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: '어떤 명령어를 언로드할까요?',
					type: 'command'
				}
			]
		});
	}

	async run(msg, args) {
		args.command.unload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) this.registry.commands.get('${args.command.name}').unload();
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command unload to other shards`);
				this.client.emit('error', err);
				await msg.reply(`Unloaded \`${args.command.name}\` command, but failed to unload on other shards.`);
				return null;
			}
		}

		await msg.reply(`Unloaded \`${args.command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		return null;
	}
};
