import { AddBoxOutlined, Link } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import SoundCloudPlayer from 'react-player/soundcloud'
import YoutubePlayer from 'react-player/youtube'
import ReactPlayer from 'react-player'

const useStyles = makeStyles(theme => ({
  contianer: {
    display: 'flex',
    alignItems: 'center'
  },
  urlInput: {
    margin: theme.spacing(1)
  },
  addSongButton: {
    margin: theme.spacing(1)
  },
  dialog: {
    textAlign: 'center'
  },
  thumbnail: {
    width: '90%'
  }
}))

const AddSong = () => {
  const [url, setUrl] = useState('')
  const [dialog, setDialog] = useState(false);
  const [playable, setPlayable] = useState(false);
  const [song, setSong] = useState({
    duration: 0,
    title: "",
    artist: "",
    thumbnail: ""
  })
  const classes = useStyles()

  useEffect(() => {
    const isPlayable = SoundCloudPlayer.canPlay(url) || YoutubePlayer.canPlay(url)
    setPlayable(isPlayable);
  }, [url])

  function handleChangeSong(event){
    const {name,value} = event.target
    setSong(prevSong => ({
      ...prevSong,
      [name]: value
    }))
  }
  function handleCloseDialog() {
    setDialog(false);
  }
  async function handleEditSong({ player }) {
    const nestedPlayer = player.player.player
    let songData;
    if (nestedPlayer.getVideoData) {
      songData = getYoutubeInfo(nestedPlayer)
    } else if (nestedPlayer.getCurrentSound) {
      songData = await getSoundcloudInfo(nestedPlayer)
    }
    setSong({ ...songData, url })
  }
  function getYoutubeInfo(player) {
    const duration = player.getDuration()
    console.log(player);
    const { title, video_id, author } = player.getVideoData();
    const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`;
    return {
      duration,
      title,
      artist: author,
      thumbnail
    }
  }
  function getSoundcloudInfo(player) {
    return new Promise(resolve => {
      player.getCurrentSound(songData => {
        if (songData) {
          resolve({
            duration: Number(songData.duration / 1000),
            title: songData.title,
            artist: songData.user.username,
            thumbnail: songData.artwork_url.replace('-large', '-t500x500')
          })
        }
      })
    })

  }
  const { thumbnail, title, artist } = song
  return (
    <div className={classes.contianer}>
      <Dialog
        className={classes.dialog}
        open={dialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent>
          <img
            className={classes.thumbnail}
            src={thumbnail}
            alt="Song thumbnail" />
          <TextField
            margin='dense'
            value={title}
            onChange={handleChangeSong}
            name='title'
            label="Title"
            variant='standard'
            fullWidth
          />
          <TextField
            margin='dense'
            value={artist}
            onChange={handleChangeSong}
            name='artist'
            label="Artist"
            variant='standard'
            fullWidth
          />
          <TextField
            margin='dense'
            value={thumbnail}
            onChange={handleChangeSong}
            name='thumbnail'
            label="Thumbnail"
            variant='standard'
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="info">Cancel</Button>
          <Button variant="outlined" color="primary">Add Song</Button>
        </DialogActions>
      </Dialog>
      <TextField
        className={classes.urlInput}
        onChange={(e) => setUrl(e.target.value)}
        value={url}
        placeholder='Add Youtube or Soundcloud Url'
        fullWidth
        margin='normal'
        variant="standard"
        type="url"
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Link />
            </InputAdornment>
          )
        }} />
      <Button
        disabled={!playable}
        onClick={() => setDialog(true)}
        variant="contained"
        className={classes.addSongButton}
        color="primary"
        endIcon={<AddBoxOutlined />}>Add</Button>
      <ReactPlayer url={url} hidden onReady={handleEditSong} />
    </div>
  )
}

export default AddSong