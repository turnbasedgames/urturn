const mongoose = require('mongoose');

const { Schema } = mongoose;

// This is used mainly to help track which sockets are stale.
// If the entire NodeJS instance is stale then, it is guaranteed that associated user sockets are
// also stale and can be cleaned up.
const ServiceInstanceSchema = new Schema({
  pingCount: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: (urbux) => Number.isInteger(urbux) && urbux >= 0,
      message: '{VALUE} is not a non-negative integer value',
    },
  },
}, { timestamps: true });

ServiceInstanceSchema.method('toJSON', function toJSON() {
  return {
    id: this.id,
    pingCount: this.pingCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

module.exports = mongoose.model('ServiceInstance', ServiceInstanceSchema);
