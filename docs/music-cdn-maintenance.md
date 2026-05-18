# 音乐 CDN 维护

这个博客的播放器走纯前端方案，歌曲映射集中在 `app/data/cdn-audio.ts`。

## 配置入口

- `MUSIC_SERVER`: 歌曲平台，比如 `tencent`
- `MUSIC_PLAYLIST_TYPE`: 歌单类型，通常是 `playlist`
- `MUSIC_PLAYLIST_ID`: 歌单 ID
- `METING_API`: Meting API 模板
- `CDN_AUDIO_BY_ID`: `server:songId -> CDN URL` 映射表

## 生成映射

把已下载音频放进本地目录后运行：

```bash
npm run music:cdn-map
```

默认会扫描：

```text
/home/tungchiahui/Desktop/music
```

也可以手动指定：

```bash
npm run music:cdn-map -- --dir /path/to/music --cdn-base-url https://cdn.example.com/music
```

## 文件命名建议

最好命名成：

```text
歌名-歌手.mp3
```

脚本会优先按歌名和歌手匹配本地文件，再生成：

```ts
'tencent:000DNTXj0gJF8O': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/马也_Crabbit%20Cole先生-海屿你.mp3',
```

中文会保留，空格会转成 `%20`。

## 输出内容

脚本会输出三类信息：

- 可以直接粘贴进 `CDN_AUDIO_BY_ID` 的条目
- 未匹配上的歌单歌曲
- 本地没被用到的音频文件

这样你可以：

1. 先把能自动匹配的条目粘进去
2. 再人工处理未匹配歌曲
3. 最后处理多出来的本地文件名

## 维护习惯

- 新歌先放本地目录
- 尽量保持 `歌名-歌手.扩展名`
- 定期跑一次脚本
- 只维护 `app/data/cdn-audio.ts`
