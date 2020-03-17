const fs = require('fs');
const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class LoadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: '로드',
			aliases: ['load-command', 'load'],
			group: 'commands',
			memberName: 'load',
			description: '새 명령어를 로드합니다.',
			details: oneLine`
				인자값은 \`group:memberName\` 형태로 완전한 명령어 이름이 주어져야 합니다.
				디스코드 봇 소유자만 이 명령어를 사용할 수 있습니다.
			`,
			examples: ['로드 some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: '어떤 명령어를 로드할까요?',
					validate: val => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve('이미 등록된 명령어입니다.');
						}
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					}),
					parse: val => {
						const split = val.split(':');
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					}
				}
			]
		});
	}

	async run(msg, args) {
		this.client.registry.registerCommand(args.command);
		const command = this.client.registry.commands.last();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						const cmdPath = this.registry.resolveCommandPath('${command.groupID}', '${command.name}');
						delete require.cache[cmdPath];
						this.registry.registerCommand(require(cmdPath));
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command load to other shards`);
				this.client.emit('error', err);
				await msg.reply(`Loaded \`${command.name}\` command, but failed to load on other shards.`);
				return null;
			}
		}

		await msg.reply(`Loaded \`${command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		return null;
	}
};
