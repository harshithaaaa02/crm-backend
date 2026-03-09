const Service = require("../models/Service");
const Notification = require("../models/Notification");

exports.createService = async (req, res) => {
  try {

    const {
      serviceName,
      createdDate,
      monthlyAmount,
      monthlyPayDate,
      handledBy,
      clientId
    } = req.body;

    const paymentDay = new Date(monthlyPayDate).getDate();

    const service = await Service.create({
      serviceName,
      createdDate,
      monthlyAmount,
      monthlyPayDate,
      paymentDay,
      handledBy,
      clientId
    });

    res.status(201).json(service);

  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET SERVICES BY CLIENT
exports.getServicesByClient = async (req, res) => {
  try {

    const services = await Service.find({
      clientId: req.params.clientId
    });

    res.json(services);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {

    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: "Service deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateService = async (req, res) => {
  try {

    const paymentDay = new Date(req.body.monthlyPayDate).getDate();

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        paymentDay
      },
      { new: true }
    );

    res.json(service);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServicesByClient = async (req, res) => {
  try {

    const services = await Service.find({
      clientId: req.params.clientId
    });

    const today = new Date().getDate();

    for (const service of services) {

      if (service.paymentDay === today) {

        const exists = await Notification.findOne({
          message: `Service payment due: ${service.serviceName}`,
          clientId: service.clientId
        });

        if (!exists) {
          await Notification.create({
            message: `Service payment due: ${service.serviceName}`,
            clientId: service.clientId,
            type: "service_due"
          });
        }

      }

    }

    res.json(services);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};