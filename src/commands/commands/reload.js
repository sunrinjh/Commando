const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class ReloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: '리로드',
			aliases: ['reload-command', 'reload'],
			group: 'commands',
			memberName: 'reload',
			description: '명령어, 혹은 명령어 그룹을 리로드합니다.',
			details: oneLine`
				인자값은 명령어 혹은 명령어 그룹의 이름/ID 여야 합니다.
				명령어 그룹을 인자값으로 제공했을 경우 그 그룹에 있는 모든 명령어를 리로드합니다.
				디스코드 봇 소유자만 이 명령어를 사용할 수 있습니다.
			`,
			examples: ['언로드 some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: '어떤 명령어를 로드할까요?',
					type: 'group|command'
				}
			]
		});
	}

	async run(msg, args) {
		const { cmdOrGrp } = args;
		const isCmd = Boolean(cmdOrGrp.groupID);
		cmdOrGrp.reload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) {
						this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : cmdOrGrp.id}').reload();
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command reload to other shards`);
				this.client.emit('error', err);
				if(isCmd) {
					await msg.reply(`Reloaded \`${cmdOrGrp.name}\` command, but failed to reload on other shards.`);
				} else {
					await msg.reply(
						`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group, but failed to reload on other shards.`
					);
				}
				return null;
			}
		}

		if(isCmd) {
			await msg.reply(`Reloaded \`${cmdOrGrp.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		} else {
			await msg.reply(
				`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group${this.client.shard ? ' on all shards' : ''}.`
			);
		}
		return null;
	}
};
