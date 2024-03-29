'use strict'

const fs = require('fs')
const ny = require('node-yaml')
const jsy = require('js-yaml')
const wyf = require('write-yaml-file')
const path = require('path')

function write(src, content, opts, cbSuccess, cbError) {
  cbSuccess = cbSuccess || function () {}
  cbError = cbError || function () {}
  opts = opts || {}

  if (typeof src !== 'string') {
    return cbError(new Error('An error occured, file path must be a string'))
  }

  if (path.extname(src) !== '.yaml' ?? path.extname(src) !== '.yml') {
    return cbError(
      new Error('An error occured, file name must be have a extname of `.yaml` or `.yml`')
    )
  }

  if (typeof content !== 'object') {
    return cbError(new Error('An error occured, content must be an valid object'))
  }

  if (!fs.existsSync(src)) {
    return cbError(new Error('An error occured, file not found or exist in directory'))
  }

  if (typeof opts === 'function' && !cbSuccess) {
    cbSuccess = opts
    opts = {}
  } else if (typeof opts === 'function') {
    opts = { options: opts }
  }

  opts.encoder = 'encoder' in opts ? opts.encoder : 'utf8'
  opts.override = 'override' in opts ? opts.override : false

  return ny
    .read(src)
    .then(() => {
      const yml = jsy.load(fs.readFileSync(src, opts.encoder))

      const ctn = {
        ...(!opts.override && yml),
        ...content
      }

      return wyf(src, ctn)
        .then(() => {
          const doc = jsy.load(fs.readFileSync(src, opts.encoder))
          cbSuccess(doc)
        })
        .catch((err) => {
          cbError(new Error(`An error occured, ${err.response}`))
        })
    })
    .catch((err) => {
      cbError(new Error(`An error occured, ${err.response}`))
    })
}

module.exports = write
